//
//  statSummaryBundle.swift
//  statSummary
//
//  Created by Matt on 8/6/26.
//

import WidgetKit
import SwiftUI

@main
struct StatSummaryBundle: WidgetBundle {
    var body: some Widget {
        StatSummary()
        StatSummaryControl()
        LockScreenStatWidget()
    }
}
